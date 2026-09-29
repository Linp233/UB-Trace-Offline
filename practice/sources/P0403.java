public class P0403 {
    static class Node {
        int value;
        Node next;
        Node(int value, Node next) {
            this.value = value;
            this.next = next;
        }
    }
    public static void main(String[] args) throws Exception {
        Node tail = new Node(9, null);
        Node middle = new Node(6, tail);
        Node head = new Node(1, middle);
        head.next = middle.next;
        System.out.println(head.next.value + ":" + middle.value);
    }
}
