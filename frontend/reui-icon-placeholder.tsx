import * as LucideIcons from "lucide-react";

export function IconPlaceholder({
  lucide,
  tabler: _tabler,
  hugeicons: _hugeicons,
  phosphor: _phosphor,
  remixicon: _remixicon,
  ...props
}: Record<string, any>) {
  const icons = LucideIcons as Record<string, any>;
  const Icon =
    (lucide && (icons[lucide] || icons[`${lucide}Icon`])) ||
    LucideIcons.Square;
  return <Icon {...props} />;
}
