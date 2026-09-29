public class P0304 {
    static class Ticket {
        static int made = 0;
        int id;
        Ticket() {
            Ticket.made++;
            this.id = Ticket.made;
        }
    }
    public static void main(String[] args) throws Exception {

        Ticket a = new Ticket();
        Ticket b = new Ticket();
        System.out.println(a.id + ":" + b.id + ":" + Ticket.made);
    }
}
