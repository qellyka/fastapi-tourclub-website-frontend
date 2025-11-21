'use client';

import React from 'react';
import { Layers } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

const layerStyles = [
  { name: 'Outdoors', url: 'mapbox://styles/mapbox/outdoors-v12' },
  { name: 'Satellite', url: 'mapbox://styles/mapbox/satellite-streets-v12' },
];

interface LayerSwitcherProps {
  currentStyle: string;
  onStyleChange: (styleUrl: string) => void;
  className?: string;
}

const LayerSwitcher: React.FC<LayerSwitcherProps> = ({
  currentStyle,
  onStyleChange,
  className,
}) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            'h-[29px] w-[29px] rounded-sm bg-background hover:bg-accent relative',
            className
          )}
        >
          <Layers
            className="h-4 w-4 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
            style={{ color: '#333333' }}
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" sideOffset={4} className="w-auto p-1">
        <div className="flex flex-col space-y-1">
          {layerStyles.map((style) => (
            <Button
              key={style.name}
              variant={currentStyle === style.url ? 'secondary' : 'ghost'}
              className="w-full justify-start"
              onClick={() => onStyleChange(style.url)}
            >
              {style.name}
            </Button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default LayerSwitcher;
