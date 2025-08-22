// components/ui/skills-input.tsx
"use client";

import { useFieldArray, useFormContext } from "react-hook-form";
import { Button } from "./button";
import { Input } from "./input";
import { Plus, X } from "lucide-react";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "./form";

interface SkillsInputProps {
  name: string;
  label?: string;
  description?: string;
  maxSkills?: number;
}

export function SkillsInput({
  name = "skills",
  label = "Skills",
  maxSkills = 10,
}: SkillsInputProps) {
  const { control, register } = useFormContext();
  const { fields, append, remove } = useFieldArray({
    control,
    name,
  });

  return (
    <FormField
      control={control}
      name={name}
      render={() => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {fields.map((field, index) => (
                <div key={field.id} className="relative group">
                  <FormControl>
                    <Input
                      {...register(`${name}.${index}`)}
                      className="pr-8"
                      placeholder={`Skill ${index + 1}`}
                    />
                  </FormControl>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-2 py-1 text-red-500 hover:bg-red-500/10"
                    onClick={() => remove(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>

            <Button
              type="button"
              variant="outline"
              className="gap-2"
              onClick={() => fields.length < maxSkills ? append("") : null}
              disabled={fields.length >= maxSkills}
            >
              <Plus className="h-4 w-4" />
              Add Skill (Max {maxSkills})
            </Button>
          </div>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}