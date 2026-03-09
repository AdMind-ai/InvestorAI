"""
Service for managing DeepL glossaries via API.
Handles create, update, delete operations for glossaries.
"""
import logging
from typing import List, Dict, Optional, Tuple

import deepl
from django.conf import settings

from core.models.deepl_glossary_reference import DeepLGlossaryReference
from core.models.glossary_entry import GlossaryEntry

logger = logging.getLogger(__name__)


class DeepLGlossaryService:
    """Service to sync local glossary entries with DeepL API."""
    
    # Map frontend language names to DeepL language codes
    LANGUAGE_MAP = {
        "Italiano": "IT",
        "Inglese": "EN",
        "Francese": "FR",
        "Spagnolo": "ES",
        "Tedesco": "DE",
        "Portoghese": "PT",
        "Russo": "RU",
        "Cinese": "ZH",
        "Giapponese": "JA",
        "Arabo": "AR",
    }
    
    def __init__(self, deepl_key: str = None):
        """Initialize DeepL translator client."""
        self.key = deepl_key or settings.DEEPL_KEY
        self.translator = deepl.Translator(self.key)
    
    def _build_glossary_name(self, company_id: int, user_id: int, scope: str) -> str:
        """Generate unique glossary name for DeepL."""
        if scope == "company":
            return f"Company_{company_id}_Glossary"
        else:
            return f"User_{user_id}_Company_{company_id}_Glossary"
    
    def _prepare_entries_by_language_pair(
        self, entries: List[GlossaryEntry], source_langs: List[str] = None
    ) -> Dict[Tuple[str, str], Dict[str, str]]:
        """
        Group glossary entries by language pairs.
        Returns dict: {(source_lang, target_lang): {original: translation}}
        
        Args:
            entries: List of glossary entries to process
            source_langs: List of source language codes (default: ["IT"])
        """
        if source_langs is None:
            source_langs = ["IT"]
        
        pairs_dict = {}
        
        for entry in entries:
            original = entry.original.strip()
            translation = entry.translation.strip() or original
            
            # Get target languages for this entry
            target_langs = entry.target_langs or ["Tutte le lingue"]
            
            # If "Tutte le lingue", add to all supported pairs
            if "Tutte le lingue" in target_langs:
                # Add to all language pairs for each source language
                for source_code in source_langs:
                    for target_name, target_code in self.LANGUAGE_MAP.items():
                        if source_code == target_code:
                            continue  # Skip source=target
                        key = (source_code, target_code)
                        if key not in pairs_dict:
                            pairs_dict[key] = {}
                        pairs_dict[key][original] = translation
            else:
                # Add to specific language pairs
                for source_code in source_langs:
                    for target_name in target_langs:
                        target_code = self.LANGUAGE_MAP.get(target_name)
                        if not target_code:
                            continue
                        
                        if source_code == target_code:
                            # DeepL doesn't support glossaries where source and target are identical.
                            continue
                        key = (source_code, target_code)
                        
                        if key not in pairs_dict:
                            pairs_dict[key] = {}
                        pairs_dict[key][original] = translation
        
        return pairs_dict
    
    def sync_glossary(
        self,
        entries: List[GlossaryEntry],
        company_id: int,
        user_id: int,
        scope: str = "company",
        source_langs: List[str] = None
    ) -> Optional[DeepLGlossaryReference]:
        """
        Create or update glossary in DeepL based on local entries.
        Returns DeepLGlossaryReference object with glossary_id.
        
        Args:
            entries: List of glossary entries to sync
            company_id: Company ID
            user_id: User ID
            scope: "company" or "user"
            source_langs: List of source language codes (default: ["IT"])
        """
        if source_langs is None:
            source_langs = ["IT"]
        
        try:
            glossary_name = self._build_glossary_name(company_id, user_id, scope)

            try:
                if scope == "company":
                    existing_ref = DeepLGlossaryReference.objects.get(
                        company_id=company_id,
                        scope=scope,
                    )
                else:
                    existing_ref = DeepLGlossaryReference.objects.get(
                        company_id=company_id,
                        created_by_id=user_id,
                        scope=scope,
                    )
            except DeepLGlossaryReference.DoesNotExist:
                existing_ref = None

            pairs_dict = self._prepare_entries_by_language_pair(entries, source_langs)

            if not pairs_dict:
                logger.info("No valid entries to sync")
                if existing_ref:
                    self._delete_reference_glossaries(existing_ref)
                    existing_ref.delete()
                return None

            old_pair_map = {}
            if existing_ref and isinstance(existing_ref.language_pairs, list):
                for pair in existing_ref.language_pairs:
                    source = pair.get("source")
                    target = pair.get("target")
                    glossary_id = pair.get("glossary_id") or existing_ref.deepl_glossary_id
                    if source and target and glossary_id:
                        old_pair_map[(source, target)] = glossary_id

            new_language_pairs = []
            total_entry_count = 0

            for (source_lang, target_lang), entries_dict in pairs_dict.items():
                if not entries_dict:
                    continue

                old_glossary_id = old_pair_map.pop((source_lang, target_lang), None)
                if old_glossary_id:
                    try:
                        self._delete_glossary(old_glossary_id)
                    except Exception as exc:
                        logger.warning(f"Could not delete old glossary {old_glossary_id}: {exc}")

                glossary = self.translator.create_glossary(
                    name=f"{glossary_name}_{source_lang}_{target_lang}",
                    source_lang=source_lang,
                    target_lang=target_lang,
                    entries=entries_dict,
                )

                total_entry_count += glossary.entry_count
                new_language_pairs.append(
                    {
                        "source": source_lang,
                        "target": target_lang,
                        "glossary_id": glossary.glossary_id,
                        "entry_count": glossary.entry_count,
                    }
                )

            if not new_language_pairs:
                logger.warning("No dictionaries to create")
                return None

            for _, obsolete_glossary_id in old_pair_map.items():
                try:
                    self._delete_glossary(obsolete_glossary_id)
                except Exception as exc:
                    logger.warning(f"Could not delete obsolete glossary {obsolete_glossary_id}: {exc}")

            primary_glossary_id = new_language_pairs[0]["glossary_id"]

            if existing_ref:
                existing_ref.deepl_glossary_id = primary_glossary_id
                existing_ref.glossary_name = glossary_name
                existing_ref.language_pairs = new_language_pairs
                existing_ref.entry_count = total_entry_count
                existing_ref.save()
                return existing_ref

            return DeepLGlossaryReference.objects.create(
                company_id=company_id,
                created_by_id=user_id,
                deepl_glossary_id=primary_glossary_id,
                glossary_name=glossary_name,
                scope=scope,
                language_pairs=new_language_pairs,
                entry_count=total_entry_count,
            )

        except deepl.DeepLException as e:
            logger.error(f"DeepL API error during sync: {e}")
            return None
        except Exception as e:
            logger.error(f"Unexpected error during glossary sync: {e}")
            return None

    def _delete_reference_glossaries(self, ref: DeepLGlossaryReference):
        """Delete all glossaries linked to a reference."""
        deleted_ids = set()

        if isinstance(ref.language_pairs, list):
            for pair in ref.language_pairs:
                glossary_id = pair.get("glossary_id")
                if glossary_id and glossary_id not in deleted_ids:
                    self._delete_glossary(glossary_id)
                    deleted_ids.add(glossary_id)

        if ref.deepl_glossary_id and ref.deepl_glossary_id not in deleted_ids:
            self._delete_glossary(ref.deepl_glossary_id)
    
    def _delete_glossary(self, glossary_id: str):
        """Delete glossary from DeepL."""
        try:
            self.translator.delete_glossary(glossary_id)
            logger.info(f"Deleted glossary {glossary_id} from DeepL")
        except deepl.DeepLException as e:
            logger.error(f"Error deleting glossary {glossary_id}: {e}")
            raise
    
    def get_glossary_id_for_translation(
        self,
        company_id: int,
        user_id: int,
        scope: str,
        source_lang: str,
        target_lang: str
    ) -> Optional[str]:
        """
        Get appropriate glossary_id for a translation request.
        Checks if glossary supports the requested language pair.
        """
        try:
            if scope == "company":
                ref = DeepLGlossaryReference.objects.get(
                    company_id=company_id,
                    scope=scope
                )
            else:
                ref = DeepLGlossaryReference.objects.get(
                    company_id=company_id,
                    created_by_id=user_id,
                    scope=scope
                )
            
            # Check if this reference has a glossary id for the language pair
            for pair in ref.language_pairs:
                if pair["source"] == source_lang and pair["target"] == target_lang:
                    return pair.get("glossary_id") or ref.deepl_glossary_id
            
            logger.debug(f"No matching language pair found for {source_lang}->{target_lang}")
            return None
            
        except DeepLGlossaryReference.DoesNotExist:
            return None
