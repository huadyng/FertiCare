import React, { useState } from "react";
import { Layout } from "antd";
import ClinicalResultsList from "./ClinicalResultsList";
import ClinicalResultDetail from "./ClinicalResultDetail";

const { Content } = Layout;

const ClinicalResultsPage = () => {
  const [selectedResultId, setSelectedResultId] = useState(null);

  return (
    <Layout
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, #ffeef3 0%, #ffe4e6 50%, #fff1f2 100%)",
      }}
    >
      <Content style={{ padding: "24px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <ClinicalResultsList
            onSelectResult={(id) => {
              console.log(
                "[ClinicalResultsPage] Chọn xem chi tiết kết quả:",
                id
              );
              setSelectedResultId(id);
            }}
            selectedResultId={selectedResultId}
          />

          {selectedResultId && (
            <ClinicalResultDetail
              resultId={selectedResultId}
              onClose={() => {
                console.log(
                  "[ClinicalResultsPage] Đóng chi tiết kết quả:",
                  selectedResultId
                );
                setSelectedResultId(null);
              }}
            />
          )}
        </div>
      </Content>
    </Layout>
  );
};

export default ClinicalResultsPage;
