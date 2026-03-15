import React from "react";
import Navbar from "../components/Navbar";
import ActivityLog from "../components/ActivityLog";

const ActivityTimeline = () => {
  return (
    <Navbar
      title="Activity Timeline"
      subtitle="Real-time audit logs of scheduling, updates, merges, and rollback automation."
    >
      <ActivityLog />
    </Navbar>
  );
};

export default ActivityTimeline;
