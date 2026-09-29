public class P0804 {
    static class Node {
        int value;
        Node left, right;
        Node(int value, Node left, Node right) {
            this.value = value;
            this.left = left;
            this.right = right;
        }
    }
    static Node find(Node node, int target) {
        while (node != null) {
            if (node.value == target) return node;
            node = target < node.value ? node.left : node.right;
        }
        return null;
    }
    public static void main(String[] args) throws Exception {
        Node left = new Node(1, null, null);
        Node right = new Node(3, null, null);
        Node root = new Node(2, left, right);
        Node found = find(root, 3);
        System.out.println(found.value);
    }
}
