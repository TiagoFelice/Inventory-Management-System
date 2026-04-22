import React from "react";
import { Avatar } from "@mantine/core";
import { IconPackage } from "@tabler/icons-react";

interface ProductImageProps {
  name: string;
  size?: number;
  radius?: number | string;
}

export const ProductImage: React.FC<ProductImageProps> = ({
  name,
  size = 56,
  radius = "md",
}) => {
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join("");

  return (
    <Avatar size={size} radius={radius} color="blue" variant="light">
      {initials || <IconPackage size={size * 0.45} />}
    </Avatar>
  );
};
