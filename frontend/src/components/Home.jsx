import PortalInfo from "../components/PortalInfo";
import CategoryCards from "../components/CategoryCards";
import WizardForm from "../components/WizardForm";

export default function Home() {
  return (
    <div className="home-page">
      <div className="home-layout">
        <div className="home-left">
          <PortalInfo />
        </div>
        <div className="home-right">
          <WizardForm />
        </div>
      </div>
      <div className="category-bottom">
        <h3>Browse Schemes by Category</h3>
        <CategoryCards />
      </div>
    </div>
  );
}

