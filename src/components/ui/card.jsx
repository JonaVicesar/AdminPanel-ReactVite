import React from "react";

const Card = ({ className, ...props }) => (
  <div className={`bg-white rounded-xl shadow-md ${className}`} {...props} />
);

const CardHeader = ({ className, ...props }) => (
  <div className={`p-6 ${className}`} {...props} />
);

const CardTitle = ({ className, ...props }) => (
  <h3 className={`text-xl font-bold ${className}`} {...props} />
);

const CardContent = ({ className, ...props }) => (
  <div className={`p-6 pt-0 ${className}`} {...props} />
);

export { Card, CardHeader, CardTitle, CardContent };