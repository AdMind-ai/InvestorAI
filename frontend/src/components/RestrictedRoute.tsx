import { ReactNode } from "react";
import { useGlobal } from "../context/GlobalContext";
import Layout from "../layouts/Layout";

interface RestrictedRouteProps {
  routeName: string;
  children: ReactNode;
}

const RestrictedRoute: React.FC<RestrictedRouteProps> = ({ routeName, children }) => {
  const { restrictedRoutes } = useGlobal();
  if (restrictedRoutes.includes(routeName)) {
    // Restricted route, render a message or redirect
    console.warn(`Access to ${routeName} is restricted.`);
    return (
      <Layout>
        <div style={{ textAlign: 'center', marginTop: 0 }}>
          <span style={{ fontSize: 80 }}>🔒</span>
          <h2>Accesso negato</h2>
          <p>Non hai il permesso per visualizzare questa pagina.</p>
        </div>
      </Layout>
    );
  }
  return <>{children}</>;
}

export default RestrictedRoute;