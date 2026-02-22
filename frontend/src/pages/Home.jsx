import PortalInfo from "../components/PortalInfo";
import CategoryCards from "../components/CategoryCards";
import WizardForm from "../components/WizardForm";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left: Portal Information */}
          <div>
            <PortalInfo />
          </div>

          {/* Right: Wizard Form */}
          <div>
            <WizardForm />
          </div>
        </div>
      </div>

      {/* Bottom: Horizontal Category Strip */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h3 className="text-2xl font-bold mb-6">Browse Schemes by Category</h3>
        <CategoryCards horizontal />
      </div>
    </div>
  );
}