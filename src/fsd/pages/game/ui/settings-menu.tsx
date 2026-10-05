import { Clock, ListChecks, Settings2, type LucideIcon } from "lucide-react";
import {
  useSettingsStore,
  useShouldDisplayErrors,
  useShouldDisplayTimer,
} from "~/fsd/app/stores";
import { buttonVariants } from "~/fsd/shared/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/fsd/shared/ui/dropdown-menu";
import { Switch } from "~/fsd/shared/ui/switch";

type ToggleItemProps = {
  icon: LucideIcon;
  label: string;
  checked: boolean;
  onToggle: () => void;
};

// Переключает весь пункт меню; Switch только показывает состояние —
// иначе его клик всплывает в onSelect и настройка переключается дважды
const ToggleItem = ({
  icon: Icon,
  label,
  checked,
  onToggle,
}: ToggleItemProps) => (
  <DropdownMenuItem
    role="menuitemcheckbox"
    aria-checked={checked}
    // Радиус рамки минус её border и padding — углы идут концентрично
    className="rounded-[calc(var(--radius-2xl)-var(--spacing)-1px)]"
    onSelect={(e: Event) => {
      e.preventDefault();
      onToggle();
    }}
  >
    <Icon />
    <span className="grow">{label}</span>
    <span className="text-sm font-medium">{checked ? "On" : "Off"}</span>
    <Switch
      checked={checked}
      tabIndex={-1}
      aria-hidden
      className="pointer-events-none"
    />
  </DropdownMenuItem>
);

export const SettingsMenu = () => {
  const shouldDisplayTimer = useShouldDisplayTimer();
  const shouldDisplayErrors = useShouldDisplayErrors();
  const { toggleTimerDisplay, toggleErrorDisplay } = useSettingsStore();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={buttonVariants({ size: "icon" })}
        aria-label="Settings"
      >
        <Settings2 />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 rounded-2xl">
        <DropdownMenuGroup>
          <ToggleItem
            icon={Clock}
            label="Show clock"
            checked={shouldDisplayTimer}
            onToggle={toggleTimerDisplay}
          />
          <ToggleItem
            icon={ListChecks}
            label="Auto-check"
            checked={shouldDisplayErrors}
            onToggle={toggleErrorDisplay}
          />
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
