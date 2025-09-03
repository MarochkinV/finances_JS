import Chart from 'chart.js/auto'

export class Main {

    constructor() {
        (async function () {
            const DATA_COUNT = 5;

            // Заменим Utils.numbers на собственный генератор случайных чисел
            function generateRandomNumbers(count, min, max) {
                return Array.from({length: count}, () =>
                    Math.floor(Math.random() * (max - min + 1)) + min
                );
            }

            // Заменим Utils.CHART_COLORS на стандартные цвета Chart.js
            const CHART_COLORS = {
                red: 'rgb(255, 99, 132)',
                orange: 'rgb(255, 159, 64)',
                yellow: 'rgb(255, 205, 86)',
                green: 'rgb(75, 192, 192)',
                blue: 'rgb(54, 162, 235)',
                purple: 'rgb(153, 102, 255)',
                grey: 'rgb(201, 203, 207)'
            };

            const data = {
                labels: ['Red', 'Orange', 'Yellow', 'Green', 'Blue'],
                datasets: [
                    {
                        label: 'Dataset 1',
                        data: generateRandomNumbers(DATA_COUNT, 0, 100),
                        backgroundColor: [
                            CHART_COLORS.red,
                            CHART_COLORS.orange,
                            CHART_COLORS.yellow,
                            CHART_COLORS.green,
                            CHART_COLORS.blue
                        ],
                    }
                ]
            };

            new Chart(
                document.getElementById('income_pie'),
                {
                    type: 'pie',
                    data: data,
                    options: {
                        responsive: true,
                        plugins: {
                            legend: {
                                position: 'top',
                            },
                            title: {
                                display: true,

                            }
                        }
                    },
                },

            );
            new Chart(
                document.getElementById('expense_pie'),
                {
                    type: 'pie',
                    data: data,
                    options: {
                        responsive: true,
                        plugins: {
                            legend: {
                                position: 'top',
                            },
                            title: {
                                display: true,

                            }
                        }
                    },
                },

            );
        })();

    }

}
