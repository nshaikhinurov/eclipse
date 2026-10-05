import cn from "clsx";
import { FaGear, FaListCheck, FaRegClock } from "react-icons/fa6";
import {
  useSettingsStore,
  useShouldDisplayErrors,
  useShouldDisplayTimer,
} from "~/fsd/app/stores";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/fsd/shared/ui/dropdown-menu";
import { Label } from "~/fsd/shared/ui/label";
import { Switch } from "~/fsd/shared/ui/switch";

type SettingsMenuProps = {
  triggerClassName?: string;
};

export const SettingsMenu = ({ triggerClassName }: SettingsMenuProps) => {
  const shouldDisplayTimer = useShouldDisplayTimer();
  const shouldDisplayErrors = useShouldDisplayErrors();
  const { toggleTimerDisplay, toggleErrorDisplay } = useSettingsStore();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          triggerClassName,
          "text-neutral-700 transition-all duration-250 ease-in-out hover:text-black",
        )}
      >
        <FaGear />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuGroup>
          <DropdownMenuItem
            onSelect={(e: Event) => {
              e.preventDefault();
              toggleTimerDisplay();
            }}
          >
            <FaRegClock />
            <span className="grow">Show clock</span>
            <div className="flex items-center space-x-2">
              <Label htmlFor="show-clock-mode">
                {shouldDisplayTimer ? "On" : "Off"}
              </Label>
              <Switch
                id="show-clock-mode"
                checked={shouldDisplayTimer}
                onCheckedChange={toggleTimerDisplay}
              />
            </div>
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={(e: Event) => {
              e.preventDefault();
              toggleErrorDisplay();
            }}
          >
            <FaListCheck />
            <span className="grow">Auto-check</span>
            <div className="flex items-center space-x-2">
              <Label htmlFor="auto-check-mode">
                {shouldDisplayErrors ? "On" : "Off"}
              </Label>
              <Switch
                id="auto-check-mode"
                checked={shouldDisplayErrors}
                onCheckedChange={toggleErrorDisplay}
              />
            </div>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
