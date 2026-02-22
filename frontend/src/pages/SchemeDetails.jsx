import { useParams } from "react-router-dom";

export default function SchemeDetails(){
  const { id } = useParams();
  return (
    <div className="card">
      <h2>Scheme Details #{id}</h2>
      <p>More info here...</p>
    </div>
  );
}
