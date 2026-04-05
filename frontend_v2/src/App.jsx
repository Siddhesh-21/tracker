import { Routes, Route } from "react-router-dom";
import Layout     from "./components/Layout.jsx";
import Dashboard  from "./pages/Dashboard.jsx";
import AddTrade   from "./pages/AddTrade.jsx";
import TradeLog   from "./pages/TradeLog.jsx";
import TradeDetail from "./pages/TradeDetail.jsx";
import Calendar   from "./pages/Calendar.jsx";
import Playbook   from "./pages/Playbook.jsx";

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/"            element={<Dashboard />} />
        <Route path="/add"         element={<AddTrade />} />
        <Route path="/trades"      element={<TradeLog />} />
        <Route path="/trades/:id"  element={<TradeDetail />} />
        <Route path="/calendar"    element={<Calendar />} />
        <Route path="/playbook"    element={<Playbook />} />
      </Routes>
    </Layout>
  );
}
