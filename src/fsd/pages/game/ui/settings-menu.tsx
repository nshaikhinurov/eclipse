import { Clock, Grid3x3, Settings2, type LucideIcon } from "lucide-react";
import {
  useBoardSize,
  useSettingsStore,
  useShouldDisplayTimer,
} from "~/fsd/app/stores";
import { cn } from "~/fsd/shared/lib/utils";
import { buttonVariants } from "~/fsd/shared/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/fsd/shared/ui/dropdown-menu";
import { Switch } from "~/fsd/shared/ui/switch";
import { BOARD_SIZES, type BoardSize } from "../model";

// Радиус рамки минус её border и padding — углы идут концентрично
const itemClassName = "rounded-[calc(var(--radius-2xl)-var(--spacing)-1px)]";

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
    className={itemClassName}
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

// Каждый сегмент — отдельный пункт меню, как вкладка: клик выбирает именно его размер.
// Пункты, а не кнопки — иначе Radix не даст дойти до них с клавиатуры
const BoardSizeItem = ({ onChange }: { onChange: () => void }) => {
  const boardSize = useBoardSize();

  const handleSelect = (e: Event, size: BoardSize) => {
    e.preventDefault();
    if (size === boardSize) return;
    useSettingsStore.getState().setBoardSize(size);
    onChange();
  };

  return (
    <div className="flex items-center gap-2 px-4 py-3 text-sm">
      <Grid3x3 className="size-4 shrink-0 text-muted-foreground" />
      <span className="grow whitespace-nowrap">Board size</span>
      <DropdownMenuGroup
        aria-label="Board size"
        className="flex rounded-full bg-input p-0.5 text-xs font-medium tabular-nums"
      >
        {BOARD_SIZES.map((size) => (
          <DropdownMenuItem
            key={size}
            role="menuitemradio"
            aria-checked={size === boardSize}
            className={cn(
              "rounded-full px-2 py-0.5 text-xs transition-colors",
              size === boardSize &&
                "bg-primary text-primary-foreground focus:bg-primary focus:text-primary-foreground",
            )}
            onSelect={(e: Event) => handleSelect(e, size)}
          >
            {size}×{size}
          </DropdownMenuItem>
        ))}
      </DropdownMenuGroup>
    </div>
  );
};

export const SettingsMenu = ({
  onBoardSizeChange,
}: {
  // Доска другого размера — это новая партия
  onBoardSizeChange: () => void;
}) => {
  const shouldDisplayTimer = useShouldDisplayTimer();
  const toggleTimerDisplay = useSettingsStore(
    (state) => state.toggleTimerDisplay,
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={buttonVariants({ size: "icon" })}
        aria-label="Settings"
      >
        <Settings2 />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72 rounded-2xl">
        <DropdownMenuGroup>
          <ToggleItem
            icon={Clock}
            label="Show clock"
            checked={shouldDisplayTimer}
            onToggle={toggleTimerDisplay}
          />
          <BoardSizeItem onChange={onBoardSizeChange} />
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
