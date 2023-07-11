import "./Background.css";

export interface Props {
  children?: React.ReactNode;
}

export const Background = ({ children }: Props) => {
  return (
    <div
      className="background"
      style={{
        backgroundImage:
          'linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url("/background-alt-1.jpeg")',
      }}
    >
      {children}
    </div>
  );
};
