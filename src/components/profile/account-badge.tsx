import AdminBadge from "./admin-badge";

type Props = {
  accountLevel: number;
}

export default function AccountBadge({ accountLevel }: Props) {
  if (accountLevel >= 9) {
    return <AdminBadge />
  }

  return null;
}