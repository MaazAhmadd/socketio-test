import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export function AccordionDemo() {
  return (
    <Accordion type="single" collapsible className="w-full">
      {/* <Accordion type="multiple"  className="w-full pr-4"> */}
      <AccordionItem value="item-1">
        <AccordionTrigger>Friends</AccordionTrigger>
        <AccordionContent className="h-[50vh]">
          All Friend here...
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>Friend Requests</AccordionTrigger>
        <AccordionContent>All Friend Requests here...</AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-3">
        <AccordionTrigger>Recents</AccordionTrigger>
        <AccordionContent>All Recent here...</AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-4">
        <AccordionTrigger>Blocked</AccordionTrigger>
        <AccordionContent>All Blocked here...</AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
