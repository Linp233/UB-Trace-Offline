public class P0404 {
    static class Node {
        int value;
        Node next;
        Node(int value, Node next) {
            this.value = value;
            this.next = next;
        }
    }
    public static void main(String[] args) throws Exception {
        Node top = null;
        top = new Node(10, top);
        top = new Node(20, top);
        int popped = top.value;
        top = top.next;
        System.out.println(popped + ":" + top.value);
    }
}
