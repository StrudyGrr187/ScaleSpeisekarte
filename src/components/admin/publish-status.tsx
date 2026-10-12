import { Badge } from "@/components/ui/badge";
import { PublishToggle } from "@/components/admin/publish-toggle";

/** The admin gets the switch, everyone else the state it is in. */
export function PublishStatus({
  published,
  canManage,
}: {
  published: boolean;
  canManage: boolean;
}) {
  if (canManage) return <PublishToggle published={published} />;
  return published ? (
    <Badge variant="success">Online</Badge>
  ) : (
    <Badge variant="warning">Noch nicht online</Badge>
  );
}
