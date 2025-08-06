import { BoothTable } from "../components/BoothList";

const Dashboard = () => {
  return (
    <div style={{ width: "100vw", height: "100dvh", overflow: "hidden" }}>
      {/* <h1>team id: {teamId}</h1> */}
      <BoothTable booth_ids={[1, 2, 3, 4, 5, 6, 7, 8]} />
    </div>
  );
};

export default Dashboard;
