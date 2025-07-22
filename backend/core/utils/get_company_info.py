from core.models.company_info import CompanyInfo


# def get_company_info():
#     return CompanyInfo.objects.first()


def get_user_company(user):
    company = getattr(user, "company", None)
    return company


def get_ceos(user):
    company = get_user_company(user)
    if not company:
        return []
    return company.ceos.all()


def get_competitors(user):
    company = get_user_company(user)
    if not company:
        return []
    return company.competitors
