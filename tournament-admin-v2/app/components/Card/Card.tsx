export interface Props {
  children: React.ReactNode;
}

export const Card = ({ children }: Props) => {
  return (
    <div className="bg-slate-600 px-2 py-2 rounded-md space-y-1 shadow-lg shadow-slate-950 transition-shadow ease-in-out duration-500 hover:shadow-xl hover:shadow-slate-950 hover:duration-500 ">
      {children}
    </div>
  );
};
