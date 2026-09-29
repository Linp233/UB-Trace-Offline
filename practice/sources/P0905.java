public class P0905 {
    public static void main(String[] args) throws Exception {
        int[][] graph = {{0,1,1}, {0,0,1}, {1,0,0}};
        int edges = 0;
        for (int row = 0; row < graph.length; row++) {
            int degree = 0;
            for (int col = 0; col < graph[row].length; col++) {
                degree += graph[row][col];
            }
            edges += degree;
            System.out.println(degree);
        }
        System.out.println(edges);
    }
}
