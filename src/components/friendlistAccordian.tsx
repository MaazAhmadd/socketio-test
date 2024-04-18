import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  // useFetchFriendRequestsReceived,
  // useFetchFriendRequestsSent,
  useFetchFriendlist,
  useGetUser,
} from "@/hooks/userHooks";
import { MemberPfpIcon } from "./RoomCard";

export function FriendlistAccordian() {
  const { data: friendlist } = useFetchFriendlist();
  // const { data: friendRequestsSent } = useFetchFriendRequestsSent();
  // const { data: friendRequestsReceived } = useFetchFriendRequestsReceived();
  return (
    <Accordion type="single" collapsible className="w-full">
      {/* <Accordion type="multiple"  className="w-full pr-4"> */}
      <AccordionItem value="item-1">
        <AccordionTrigger>Friends</AccordionTrigger>
        <AccordionContent className="flex flex-wrap justify-center gap-2">
          {(!friendlist || friendlist.length < 1) && "Friend List..."}
          {friendlist &&
            [
              ...friendlist,
              ...friendlist,
              ...friendlist,
              ...friendlist,
              ...friendlist,
            ]?.map((f, i) => <Friend handle={f} key={i} />)}
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

const Friend = ({ handle }: { handle: string }) => {
  console.log("Friend component: ", handle);

  const { data } = useGetUser(handle);
  if (!data) return;
  return (
    <div className="flex w-[120px] flex-col justify-center rounded bg-muted/50 p-2 text-center">
      <MemberPfpIcon m={data} className="mx-auto size-[60px] md:size-[75px]" />
      <p
        className="text-primary"
        style={{
          overflowWrap: "break-word",
        }}
      >
        {data.name || "name"}
      </p>
      <p
        className="text-sm text-muted-foreground"
        style={{
          overflowWrap: "break-word",
        }}
      >
        @{data.handle}
      </p>
    </div>
  );
};
