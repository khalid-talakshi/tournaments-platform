import { getImage } from "../../api";
import { useQuery } from "@tanstack/react-query";

export interface Props {
  imageKey?: string;
  token: string;
  headshot?: string;
  cardImage?: boolean;
}

export const S3Image = ({ imageKey, token, headshot, cardImage }: Props) => {
  console.log(imageKey);
  const { data } = useQuery(["image", token, imageKey], getImage, {
    enabled: Boolean(imageKey),
  });
  console.log(data);
  if (headshot) {
    return (
      <img
        src={headshot}
        style={{ width: "100%", height: "auto" }}
        alt={"headshot"}
      />
    );
  }
  return (
    <img
      src={data}
      style={{ width: "100%", height: "auto" }}
      alt={imageKey}
      className={cardImage ? "card-img-top" : ""}
    />
  );
};
