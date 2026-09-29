public class P0801 {
    static class Node {
        int value;
        Node left, right;
        Node(int value, Node left, Node right) {
            this.value = value;
            this.left = left;
            this.right = right;
        }
    }

    public static void main(String[] args) throws Exception {
        Node left = new Node(1, null, null);
        Node right = new Node(3, null, null);
        Node root = new Node(2, left, right);
        Node alias = root.left;
        alias.value += 4;
        int total = root.value + root.left.value + root.right.value;
        System.out.println(total);
    }
}
