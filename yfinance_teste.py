import yfinance as yf


def print_section(f, title):
    f.write("\n" + "=" * 60 + "\n")
    f.write(f"{title}\n")
    f.write("=" * 60 + "\n")


def print_attribute(f, ticker, attr_name):
    try:
        value = getattr(ticker, attr_name)
        f.write(f"{attr_name}:\n{str(value)[:500]}\n---\n")
    except Exception as e:
        f.write(f"Erro lendo atributo {attr_name}: {e}\n")


def print_method(f, ticker, method_name, *args, **kwargs):
    try:
        method = getattr(ticker, method_name)
        value = method(*args, **kwargs)
        f.write(f"{method_name}:\n{str(value)[:500]}\n---\n")
    except Exception as e:
        f.write(f"Erro executando método {method_name}: {e}\n")


def main():
    ticker_symbol = "GRN.MI"
    t = yf.Ticker(ticker_symbol)

    with open("saida_ticker.txt", "w", encoding="utf-8") as f:

        # =====================
        # PRINT ATTRIBUTES
        # =====================
        print_section(f, "ATRIBUTOS")
        attributes = [
            'actions', 'analyst_price_targets', 'balance_sheet', 'balancesheet',
            'fast_info', 'calendar', 'capital_gains', 'cash_flow', 'cashflow', 'dividends',
            'earnings_dates', 'earnings_estimate', 'earnings_history',
            'eps_revisions', 'eps_trend', 'fast_info', 'financials', 'funds_data',
            'growth_estimates', 'history_metadata', 'income_stmt', 'incomestmt', 'info',
            'insider_purchases', 'insider_roster_holders', 'insider_transactions', 'institutional_holders',
            'isin', 'major_holders', 'mutualfund_holders', 'news', 'options', 'quarterly_balance_sheet',
            'quarterly_balancesheet', 'quarterly_cash_flow', 'quarterly_cashflow', 'quarterly_earnings',
            'quarterly_financials', 'quarterly_income_stmt', 'quarterly_incomestmt', 'recommendations',
            'recommendations_summary', 'revenue_estimate', 'sec_filings', 'shares', 'splits', 'sustainability',
            'ttm_cash_flow', 'ttm_cashflow', 'ttm_financials', 'ttm_income_stmt', 'ttm_incomestmt',
            'upgrades_downgrades'
        ]
        for attr in attributes:
            print_attribute(f, t, attr)

        # =====================
        # PRINT METHODS
        # =====================
        print_section(f, "MÉTODOS PRINCIPAIS")
        print_method(f, t, 'get_info')
        print_method(f, t, 'get_fast_info')
        print_method(f, t, 'get_isin')
        print_method(f, t, 'get_options')

        # Métodos de histórico e financeiros
        print_method(f, t, 'history', period="1mo")
        print_method(f, t, 'get_balance_sheet')
        print_method(f, t, 'get_cash_flow')
        print_method(f, t, 'get_income_stmt')
        print_method(f, t, 'get_earnings')
        print_method(f, t, 'get_earnings_dates', limit=5)
        print_method(f, t, 'get_dividends')
        print_method(f, t, 'get_splits')
        print_method(f, t, 'get_actions')
        print_method(f, t, 'get_analyst_price_targets')
        print_method(f, t, 'get_recommendations')
        print_method(f, t, 'get_calendar')
        print_method(f, t, 'get_major_holders')
        print_method(f, t, 'get_institutional_holders')
        print_method(f, t, 'get_mutualfund_holders')
        print_method(f, t, 'get_funds_data')
        print_method(f, t, 'get_sec_filings')
        print_method(f, t, 'get_sustainability')
        print_method(f, t, 'get_news', count=3)
        print_method(f, t, 'get_recommendations_summary')
        print_method(f, t, 'get_revenue_estimate')
        print_method(f, t, 'get_shares')
        print_method(f, t, 'get_shares_full')
        print_method(f, t, 'option_chain')


if __name__ == "__main__":
    main()
