import { Clock, ListChecks, Settings2 } from "lucide-react";
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
import { Label } from "~/fsd/shared/ui/label";
import { Switch } from "~/fsd/shared/ui/switch";

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
          <DropdownMenuItem
            onSelect={(e: Event) => {
              e.preventDefault();
              toggleTimerDisplay();
            }}
          >
            <Clock />
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
            <ListChecks />
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
