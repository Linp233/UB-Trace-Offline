public class P0401 {
    static class Node {
        int value;
        Node next;
        Node(int value, Node next) {
            this.value = value;
            this.next = next;
        }
    }
    public static void main(String[] args) throws Exception {
        Node tail = new Node(7, null);
        Node head = new Node(3, tail);
        int total = head.value + head.next.value;
        System.out.println(total);
    }
}
