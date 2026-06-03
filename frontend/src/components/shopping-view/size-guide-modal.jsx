import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Ruler } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

function SizeGuideModal({ category }) {
  // Simple mock data depending on category
  const getTableData = () => {
    if (category === "men" || category === "women") {
      return (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Size</TableHead>
              <TableHead>Chest (in)</TableHead>
              <TableHead>Waist (in)</TableHead>
              <TableHead>Hips (in)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow><TableCell>XS</TableCell><TableCell>32-34</TableCell><TableCell>26-28</TableCell><TableCell>34-36</TableCell></TableRow>
            <TableRow><TableCell>S</TableCell><TableCell>35-37</TableCell><TableCell>29-31</TableCell><TableCell>37-39</TableCell></TableRow>
            <TableRow><TableCell>M</TableCell><TableCell>38-40</TableCell><TableCell>32-34</TableCell><TableCell>40-42</TableCell></TableRow>
            <TableRow><TableCell>L</TableCell><TableCell>41-43</TableCell><TableCell>35-37</TableCell><TableCell>43-45</TableCell></TableRow>
            <TableRow><TableCell>XL</TableCell><TableCell>44-46</TableCell><TableCell>38-40</TableCell><TableCell>46-48</TableCell></TableRow>
            <TableRow><TableCell>XXL</TableCell><TableCell>47-49</TableCell><TableCell>41-43</TableCell><TableCell>49-51</TableCell></TableRow>
          </TableBody>
        </Table>
      );
    }
    if (category === "footwear") {
      return (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>UK Size</TableHead>
              <TableHead>US Size</TableHead>
              <TableHead>EU Size</TableHead>
              <TableHead>Centimeters (cm)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow><TableCell>6</TableCell><TableCell>7</TableCell><TableCell>40</TableCell><TableCell>24.6</TableCell></TableRow>
            <TableRow><TableCell>7</TableCell><TableCell>8</TableCell><TableCell>41</TableCell><TableCell>25.4</TableCell></TableRow>
            <TableRow><TableCell>8</TableCell><TableCell>9</TableCell><TableCell>42</TableCell><TableCell>26.2</TableCell></TableRow>
            <TableRow><TableCell>9</TableCell><TableCell>10</TableCell><TableCell>43</TableCell><TableCell>27.1</TableCell></TableRow>
            <TableRow><TableCell>10</TableCell><TableCell>11</TableCell><TableCell>44</TableCell><TableCell>27.9</TableCell></TableRow>
          </TableBody>
        </Table>
      );
    }
    return (
      <div className="text-sm text-muted-foreground p-4 text-center">
        No size guide available for this category. One size typically fits most.
      </div>
    );
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-primary hover:text-primary-dark font-semibold">
          <Ruler className="w-4 h-4" /> Size Guide
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Size Guide & Measurements</DialogTitle>
          <DialogDescription>
            Use this guide to find your perfect fit. Measurements are approximate.
          </DialogDescription>
        </DialogHeader>
        <div className="pt-4 overflow-x-auto">
          {getTableData()}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default SizeGuideModal;
