'use client';

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";
import { Check, X, ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";

const multiSelectVariants = cva(
  "m-1 border-foreground/10",
  {
    variants: {
      variant: {
        default:
          "border-2 rounded-md",
        destructive:
          "border-2 border-destructive text-destructive rounded-md",
        secondary:
          "border-2 border-secondary text-secondary rounded-md",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

interface MultiSelectProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof multiSelectVariants> {
  options: {
    label: string;
    value: string;
    icon?: React.ComponentType<{ className?: string }>;
  }[];
  onValueChange: (value: string[]) => void;
  defaultValue: string[];
  placeholder?: string;
  animation?: number;
  maxCount?: number;
  asChild?: boolean;
  className?: string;
}

export const MultiSelect = React.forwardRef<HTMLButtonElement, MultiSelectProps>(({ options, onValueChange, variant, defaultValue, placeholder = "Select options", animation = 0, maxCount = 3, asChild = false, className, ...props }, ref) => {
  const [selectedValues, setSelectedValues] = React.useState<string[]>(defaultValue || []);
  const [isPopoverOpen, setIsPopoverOpen] = React.useState(false);

  React.useEffect(() => {
    setSelectedValues(defaultValue || []);
  }, [defaultValue]);

  const handleInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      setIsPopoverOpen(true);
    } else if (event.key === "Backspace" && !event.currentTarget.value) {
      const newSelectedValues = [...selectedValues];
      newSelectedValues.pop();
      setSelectedValues(newSelectedValues);
      onValueChange(newSelectedValues);
    }
  };

  const toggleOption = (value: string) => {
    const newSelectedValues = selectedValues.includes(value)
      ? selectedValues.filter((v) => v !== value)
      : [...selectedValues, value];
    setSelectedValues(newSelectedValues);
    onValueChange(newSelectedValues);
  };
  
  const safeSelectedValues = Array.isArray(selectedValues) ? selectedValues : [];

  return (
    <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
      <PopoverTrigger asChild>
        <Button
          ref={ref}
          {...props}
          onClick={() => setIsPopoverOpen(!isPopoverOpen)}
          className="flex w-full p-1 rounded-md border min-h-10 h-auto items-center justify-between bg-inherit hover:bg-card"
        >
          {safeSelectedValues.length > 0 ? (
            <div className="flex justify-between items-center w-full">
              <div className="flex flex-wrap items-center">
                {safeSelectedValues.slice(0, maxCount).map((value) => {
                  const option = options.find((o) => o.value === value);
                  const IconComponent = option?.icon;
                  return (
                    <Badge
                      key={value}
                      className={cn(multiSelectVariants({ variant }))}
                      style={{ animation: `scaleIn ${animation}ms ease-in-out` }}
                    >
                      {IconComponent && <IconComponent className="h-4 w-4 mr-2" />}
                      {option?.label}
                      <X
                        className="h-4 w-4 ml-2 cursor-pointer"
                        onClick={(event) => {
                          event.stopPropagation();
                          toggleOption(value);
                        }}
                      />
                    </Badge>
                  );
                })}
                {safeSelectedValues.length > maxCount && (
                  <Badge
                    className={cn(multiSelectVariants({ variant }), "bg-muted/80")}
                    style={{ animation: `scaleIn ${animation}ms ease-in-out` }}
                  >
                    +{safeSelectedValues.length - maxCount}
                  </Badge>
                )}
              </div>
              <div className="flex items-center justify-between">
                <ChevronsUpDown className="h-4 w-4 ml-2 cursor-pointer" />
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between w-full mx-auto">
              <span className="text-sm text-muted-foreground mx-3">{placeholder}</span>
              <ChevronsUpDown className="h-4 w-4 mx-2 cursor-pointer" />
            </div>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search..." onKeyDown={handleInputKeyDown} />
          <CommandEmpty>No options found.</CommandEmpty>
          <CommandGroup>
            {options.map((option) => {
              const isSelected = safeSelectedValues.includes(option.value);
              return (
                <CommandItem
                  key={option.value}
                  onSelect={() => toggleOption(option.value)}
                  style={{ pointerEvents: "auto", opacity: 1 }}
                  className="cursor-pointer"
                >
                  <div className={cn("mr-2 flex items-center justify-center h-4 w-4 rounded-sm border border-primary", isSelected ? "bg-primary text-primary-foreground" : "opacity-50")}>
                    {isSelected && <Check className="h-4 w-4" />}
                  </div>
                  {option.icon && <option.icon className="mr-2 h-4 w-4 text-muted-foreground" />}
                  <span>{option.label}</span>
                </CommandItem>
              );
            })}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
});

MultiSelect.displayName = "MultiSelect";