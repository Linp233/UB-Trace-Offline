public class P0405 {
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
        Node tail = head;
        tail.next = new Node(8, null);
        tail = tail.next;
        int removed = head.value;
        head = head.next;
        System.out.println(removed + ":" + (head == tail));
    }
}
