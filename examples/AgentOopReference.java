public class AgentOopReference {
    static class Counter {
        static int calls = 0;
        protected int value;

        Counter(int start) {
            this.value = start;
        }

        int bump(int delta) {
            Counter.calls++;
            this.value += delta;
            return this.value;
        }
    }

    static class StepCounter extends Counter {
        private int step;

        StepCounter(int start, int step) {
            super(start);
            this.step = step;
        }

        @Override
        int bump(int times) {
            return super.bump(times * this.step);
        }
    }

    public static void main(String[] args) {
        Counter first = new StepCounter(2, 3);
        Counter alias = first;
        int total = 0;
        for (int i = 0; i < 2; i++) {
            int result = alias.bump(i + 1);
            total += result;
        }
        Counter second = new Counter(10);
        int finalValue = second.bump(1);
        String label = "total";
        System.out.println(first.value);
        System.out.println(label + ":" + total);
        System.out.println(finalValue);
    }
}
