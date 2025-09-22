'use client';

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { User } from "@/types";

interface UserSearchComboboxProps {
  users: User[];
  value: string;
  onSelect: (value: string) => void;
  placeholder?: string;
}

export function UserSearchCombobox({ users, value, onSelect, placeholder }: UserSearchComboboxProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between font-normal"
        >
          {value
            ? users.find((user) => String(user.id) === value)?.full_name
            : placeholder || "Выберите пользователя..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
        <Command filter={(value, search) => {
          const user = users.find(u => u.id === parseInt(value, 10));
          if (!user) return 0;

          const searchTerm = search.toLowerCase();
          const matchesName = user.full_name.toLowerCase().includes(searchTerm);
          const matchesUsername = user.username.toLowerCase().includes(searchTerm);

          if (matchesName || matchesUsername) return 1;
          return 0;
        }}>
          <CommandInput placeholder="Поиск по ФИО или логину..." />
          <CommandList>
            <CommandEmpty>Пользователь не найден.</CommandEmpty>
            <CommandGroup>
              {users.map((user) => (
                <CommandItem
                  key={user.id}
                  value={String(user.id)}
                  onSelect={(currentValue) => {
                    onSelect(currentValue === value ? "" : String(user.id));
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === String(user.id) ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {user.full_name} ({user.username})
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
