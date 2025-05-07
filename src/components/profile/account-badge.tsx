import AdminBadge from "./admin-badge";
import DevTesterBadge from "./dev-tester-badge";

type Props = {
  accountLevel: number;
}

export default function AccountBadge({ accountLevel }: Props) {
  if (accountLevel >= 9) {
    return <AdminBadge />;
  } else if (accountLevel === 6) {
    // Dev版テスター
    return <DevTesterBadge />;
  }

  return null;
}