import React from "react";

export interface Props {
  children: React.ReactNode;
}

export const PageTitle = ({ children }: Props) => {
  return <h1 className="text-6xl font-bold">{children}</h1>;
};
