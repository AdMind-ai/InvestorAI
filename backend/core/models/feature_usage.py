from django.db import models
from django.utils import timezone
from core.models.company_info.company_info import CompanyInfo


class FeatureUsage(models.Model):
    MODULE_EARNINGS = 'earnings'

    MODULE_CHOICES = [
        (MODULE_EARNINGS, 'Earnings Call'),
    ]

    FEATURE_TRADUTTORE = 'traduttore'
    FEATURE_CREA_SPEECH = 'crea_speech'
    FEATURE_TRASCRIZIONE = 'trascrizione_audio'

    FEATURE_CHOICES = [
        (FEATURE_TRADUTTORE, 'Traduttore'),
        (FEATURE_CREA_SPEECH, 'Crea speech'),
        (FEATURE_TRASCRIZIONE, 'Trascrizione audio'),
    ]

    # Associate usage by company
    company = models.ForeignKey(CompanyInfo, on_delete=models.CASCADE, related_name='feature_usages', null=True, blank=True)
    module = models.CharField(max_length=50, choices=MODULE_CHOICES, default=MODULE_EARNINGS)
    feature = models.CharField(max_length=50, choices=FEATURE_CHOICES)
    count = models.PositiveIntegerField(default=0)
    max_limit = models.PositiveIntegerField(null=True, blank=True, help_text='Optional max uses allowed for this feature per period/company')
    last_used = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Feature usage'
        verbose_name_plural = 'Features usage'
        unique_together = ('module', 'feature', 'company')

    def __str__(self):
        return f"{self.module}:{self.feature} -> {self.count}"

    @classmethod
    def increment(cls, feature: str, company, module: str = MODULE_EARNINGS, delta: int = 1):
        """Atomically increment usage counter for a feature for a given company and return the object.

        Raises ValueError if company is not provided or if max_limit reached.
        """
        if company is None:
            raise ValueError("company is required for incrementing feature usage")

        # accept company as id or object
        if not hasattr(company, 'pk'):
            company = CompanyInfo.objects.filter(pk=company).first()
            if not company:
                raise ValueError("company not found")

        from django.db.models import F
        # if creating for the first time, provide a sensible default max_limit for earnings
        defaults = {'count': 0}
        if module == cls.MODULE_EARNINGS:
            # default max uses for earnings features is 0 (disabled) unless explicitly set
            defaults.setdefault('max_limit', 0)

        obj, created = cls.objects.get_or_create(module=module, feature=feature, company=company, defaults=defaults)

        # Check limit
        if obj.max_limit is not None and obj.count >= obj.max_limit:
            raise ValueError("limit_reached")

        # Use F to avoid race conditions
        cls.objects.filter(pk=obj.pk).update(count=F('count') + delta, last_used=timezone.now())
        obj.refresh_from_db()
        return obj
