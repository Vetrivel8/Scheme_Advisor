import SchemeCard from "../components/SchemeCard";

const dummySchemes = [
  {
    id:1,
    name:"PM-KISAN",
    desc:"₹6000 per year",
    why:["Farmer","Low Income"],
    docs:["Aadhaar","Bank Passbook"]
  }
];

export default function Results(){
  return (
    <div>
      <h2>Eligible Schemes</h2>
      {dummySchemes.map(s=> <SchemeCard key={s.id} scheme={s}/>)}
    </div>
  );
}
