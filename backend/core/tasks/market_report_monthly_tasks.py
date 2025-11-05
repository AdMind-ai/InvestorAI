import os
import json
import logging
from datetime import datetime, timedelta

from celery import shared_task
from django.utils import timezone

from openai import OpenAI

from core.models.company_info import CompanyInfo
from core.models.summary_news_model import SummaryNewsArticle
from core.models.market_company_report import CompanyMarketReport
from core.utils.tasks.collect_market_news import safe_load_json

logger = logging.getLogger(__name__)
client = OpenAI(api_key=os.getenv("OPENAI_KEY"))


def _previous_month_bounds(now=None):
	"""
	Returns timezone-aware start (inclusive) and end (exclusive) datetimes for the previous calendar month
	relative to 'now'. Example: if now is 2025-11-05, returns (2025-10-01 00:00, 2025-11-01 00:00).
	"""
	if now is None:
		now = timezone.now()
	first_of_current = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
	# end_exclusive is the first day of current month
	end_exclusive = first_of_current
	# start is first day of previous month
	last_month_last_day = first_of_current - timedelta(days=1)
	start_in_naive = last_month_last_day.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
	# ensure aware
	if timezone.is_naive(start_in_naive):
		start = timezone.make_aware(start_in_naive)
	else:
		start = start_in_naive
	if timezone.is_naive(end_exclusive):
		end_exclusive = timezone.make_aware(end_exclusive)
	return start, end_exclusive


def _normalize_links(value):
	"""Normalize links stored in SummaryNewsArticle.sources_urls to a list[str]."""
	if value is None:
		return []
	# already list
	if isinstance(value, (list, tuple)):
		return [str(x) for x in value if x]
	# try json
	s = str(value).strip()
	if not s:
		return []
	try:
		parsed = json.loads(s)
		if isinstance(parsed, list):
			return [str(x) for x in parsed if x]
	except Exception:
		pass
	# comma-separated
	if "," in s:
		return [it.strip() for it in s.split(",") if it.strip()]
	return [s]


# ==============================================
# Task MI04 – Monthly Market Report Generation
# ==============================================
@shared_task(bind=True)
def generate_market_monthly_report(self, company_id):
	"""
	Gathers last month's summary items for the given company and calls OpenAI (MI04)
	to generate a monthly market report. Saves the result into CompanyMarketReport.

	Input to MI04 (conceptual):
	- company_name: optional string
	- summaries: list of objects with keys: summary_description, summary_relevance (High|Medium|Low),
	  summary_category, summary_links (list of 1-5 URLs)

	Expected MI04 output: a JSON object with keys
	- report_period: "MM-YYYY"
	- company_name: string
	- report_description: Markdown string
	"""

	result = {
		"success": False,
		"company": None,
		"period": None,
		"report_id": None,
		"message": "",
	}

	try:
		company = CompanyInfo.objects.get(id=company_id)
		result["company"] = company.long_name

		start, end = _previous_month_bounds()
		# period label MM-YYYY for previous month
		period_label = (start.astimezone(timezone.get_current_timezone())).strftime("%m-%Y")
		result["period"] = period_label

		qs = SummaryNewsArticle.objects.filter(
			company_fk=company,
			created_at__gte=start,
			created_at__lt=end,
		).order_by("-created_at")

		if not qs.exists():
			# Fallback: fetch most recent summaries AFTER the end of previous month
			qs = SummaryNewsArticle.objects.filter(
				company_fk=company,
				created_at__gte=end,
			).order_by("-created_at")

			if not qs:
				result["message"] = "No summaries found for previous month nor recent ones after that."
				return result
			logger.info(
				f"[MI04] Fallback engaged: using {len(qs)} summaries after {end.isoformat()} for company={company.long_name}"
			)

		summaries_payload = []
		for item in qs:
			relevance = (item.relevance or "").strip().lower()
			if relevance in {"high", "medium", "low"}:
				relevance = relevance.capitalize()
			else:
				relevance = None
			summaries_payload.append({
				"summary_description": (item.description or "").strip(),
				"summary_relevance": relevance,
				"summary_category": (item.category or "").strip(),
				"summary_links": _normalize_links(item.sources_urls)[:5],
			})

		payload = {
			"company_name": company.long_name,
			"report_period": period_label,
			"summaries": summaries_payload,
		}

		try:
			input_json = json.dumps(payload, ensure_ascii=False)
		except Exception:
			# fallback if something is not serializable in links
			for s in payload["summaries"]:
				if not isinstance(s.get("summary_links"), list):
					s["summary_links"] = _normalize_links(s.get("summary_links"))
			input_json = json.dumps(payload, ensure_ascii=False)

		logger.info(f"[MI04] company={company.long_name} period={period_label} summaries={len(summaries_payload)}")

		response = client.responses.create(
			prompt={"id": os.getenv("OPENAI_PROMPT_ID_MI04")},
			input=input_json,
			store=True,
			include=[
				"reasoning.encrypted_content"
			],
			timeout=600,
		)

		raw_output = response.output_text
		logger.info(f"[MI04] raw_output_length={len(raw_output)}")

		report_obj = safe_load_json(raw_output)
		if not isinstance(report_obj, dict):
			result["message"] = "MI04 did not return a JSON object."
			return result

		report_description = (report_obj.get("report_description") or "").strip()
		if not report_description:
			result["message"] = "MI04 returned empty report description."
			return result

		citations = None
		if "citations" in report_obj:
			try:
				citations = json.dumps(report_obj["citations"], ensure_ascii=False)
			except Exception:
				citations = None

		saved = CompanyMarketReport.objects.create(
			company=company.long_name,
			report=report_description,
			citations=citations,
		)

		result.update({
			"success": True,
			"report_id": saved.id,
			"message": "Monthly market report generated successfully.",
		})
		return result

	except CompanyInfo.DoesNotExist:
		result["message"] = "Company not found."
		return result
	except Exception as e:
		logger.exception(f"Error in MI04 task: {e}")
		result["message"] = str(e)
		return result
