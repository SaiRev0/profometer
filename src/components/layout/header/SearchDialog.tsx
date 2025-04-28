import {
    Command,
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator
} from '@/components/ui/command';
import { SearchResults } from '@/lib/types/navigation';

import { Search } from 'lucide-react';

interface SearchDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    searchResults: SearchResults;
    onBranchSelect: (branchName: string) => void;
}

export function SearchDialog({ open, onOpenChange, searchResults, onBranchSelect }: SearchDialogProps) {
    return (
        <CommandDialog open={open} onOpenChange={onOpenChange}>
            <CommandInput placeholder='Search professors, branches, courses...' />
            <CommandList>
                <CommandEmpty>No results found.</CommandEmpty>
                <CommandGroup heading='Popular Searches'>
                    {searchResults.popular.map((term) => (
                        <CommandItem
                            key={term}
                            onSelect={() => {
                                onOpenChange(false);
                                // Handle search
                            }}>
                            <Search className='mr-2 h-4 w-4' />
                            {term}
                        </CommandItem>
                    ))}
                </CommandGroup>
                <CommandSeparator />
                <CommandGroup heading='Professors'>
                    {searchResults.professors.map((prof) => (
                        <CommandItem
                            key={prof.id}
                            onSelect={() => {
                                onOpenChange(false);
                                // Navigate to professor page
                            }}>
                            <div className='flex flex-col'>
                                <span>{prof.name}</span>
                                <span className='text-muted-foreground text-sm'>{prof.department}</span>
                            </div>
                        </CommandItem>
                    ))}
                </CommandGroup>
                <CommandSeparator />
                <CommandGroup heading='Branches'>
                    {searchResults.branches.map((branch) => (
                        <CommandItem
                            key={branch.id}
                            onSelect={() => {
                                onOpenChange(false);
                                onBranchSelect(branch.name);
                                // Navigate to branch page
                            }}>
                            <div className='flex flex-col'>
                                <span>{branch.name}</span>
                                <span className='text-muted-foreground text-sm'>{branch.professors} professors</span>
                            </div>
                        </CommandItem>
                    ))}
                </CommandGroup>
            </CommandList>
        </CommandDialog>
    );
}
