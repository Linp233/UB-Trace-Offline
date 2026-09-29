public class P0402 {
    static class Node {
        int value;
        Node next;
        Node(int value, Node next) {
            this.value = value;
            this.next = next;
        }
    }
    public static void main(String[] args) throws Exception {
        Node head = new Node(5, null);
        Node old = head;
        head = new Node(2, head);
        System.out.println(head.next == old);
    }
}
