public class P0903 {
    static void dfs(int[][] graph, boolean[] seen, int vertex) {
        if (seen[vertex]) return;
        seen[vertex] = true;
        System.out.println(vertex);
        for (int next : graph[vertex]) {
            dfs(graph, seen, next);
        }
    }
    public static void main(String[] args) throws Exception {
        int[][] graph = {{1, 2}, {2}, {}};
        boolean[] seen = new boolean[3];
        dfs(graph, seen, 0);
    }
}
