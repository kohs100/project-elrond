import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { ReactTabulator } from "react-tabulator";
import "tabulator-tables/dist/css/tabulator.min.css";
import { clearLine } from "readline";

interface Team {
  id: number;
  name: string;
}

const DataTable: React.FC = () => {
  const [users, setUsers] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    const { data, error } = await supabase
      .from("team")
      .select("id, name, event_id");

    if (error) {
      console.error("데이터 불러오기 오류:", error);
    } else {
      setUsers(data || []);
    }
    setLoading(false);
  };

  const handleCellEdited = async (cell: any) => {
    const updatedRow = cell.getRow().getData() as Team;
    const field = cell.getField();
    const value = cell.getValue();

    const { error } = await supabase
      .from("team")
      .update({ [field]: value })
      .eq("id", updatedRow.id);

    if (error) {
      console.error("업데이트 오류:", error);
    } else {
      console.log("업데이트 성공:", updatedRow);
    }
  };

  useEffect(() => {
    console.log("Fetching...");
    fetchUsers();
  }, []);

  const columns = [
    { title: "ID", field: "id", width: 100 },
    { title: "이름", field: "name" },
    { title: "이벤트", field: "event_id" },
  ];

  return (
    <div style={{ padding: "20px" }}>
      <h1>📋 사용자 목록 (Tabulator)</h1>
      {loading ? (
        <p>데이터 불러오는 중...</p>
      ) : (
        <ReactTabulator
          data={users}
          columns={columns}
          layout="fitData"
          cellEdited={handleCellEdited}
          options={{
            pagination: "local",
            paginationSize: 5,
          }}

        />
      )}
    </div>
  );
};

export default DataTable;
