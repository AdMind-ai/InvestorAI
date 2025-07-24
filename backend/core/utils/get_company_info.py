from core.models.company_info import CompanyInfo, CEO, CompetitorInfo


def get_user_company(user):
    company = getattr(user, "company", None)
    return company


def get_ceos(user_or_company):
    # Pode ser user ou CompanyInfo
    if isinstance(user_or_company, CompanyInfo):
        company = user_or_company
    else:
        company = get_user_company(user_or_company)
    if not company:
        return CEO.objects.none()
    return company.ceos.all()


def get_competitors(user_or_company):
    # user_or_company pode ser um usuário, geralmente, ou a company diretamente
    if isinstance(user_or_company, CompanyInfo):
        company = user_or_company
    else:
        company = get_user_company(user_or_company)
    if not company:
        return CompetitorInfo.objects.none()
    return company.competitors.all()
