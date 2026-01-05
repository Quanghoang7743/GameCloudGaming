'use client';

import { useEffect, useRef } from 'react';
import { Box } from '@mui/material';

const colors = [
    "#ffb56b", "#fdaf69", "#f89d63", "#f59761", "#ef865e", "#ec805d", "#e36e5c",
    "#df685c", "#d5585c", "#d1525c", "#c5415d", "#c03b5d", "#b22c5e", "#ac265e",
    "#9c155f", "#950f5f", "#830060", "#7c0060", "#680060", "#60005f", "#48005f",
    "#3d005e"
];

export default function CursorTrail() {
    // Dùng useRef để lưu trữ tham chiếu đến các phần tử DOM mà không gây re-render
    const circlesRef = useRef<(HTMLDivElement | null)[]>([]);
    const coords = useRef({ x: 0, y: 0 });
    const requestRef = useRef<number>(0);

    useEffect(() => {
        // Khởi tạo vị trí ban đầu cho các phần tử
        circlesRef.current.forEach((circle) => {
            if (circle) {
                // Gán thuộc tính x, y trực tiếp vào object DOM element để tính toán
                (circle as any).x = 0;
                (circle as any).y = 0;
            }
        });

        const handleMouseMove = (e: MouseEvent) => {
            coords.current.x = e.clientX;
            coords.current.y = e.clientY;
        };

        window.addEventListener("mousemove", handleMouseMove);

        const animateCircles = () => {
            let x = coords.current.x;
            let y = coords.current.y;

            circlesRef.current.forEach((circle, index) => {
                if (!circle) return;

                // Logic tính toán vị trí (giống hệt code gốc)
                circle.style.left = x - 12 + "px";
                circle.style.top = y - 12 + "px";
                circle.style.transform = `scale(${(circlesRef.current.length - index) / circlesRef.current.length})`;

                // Lưu vị trí hiện tại vào element
                (circle as any).x = x;
                (circle as any).y = y;

                const nextCircle = circlesRef.current[index + 1] || circlesRef.current[0];
                if (nextCircle) {
                    // Tính toán vị trí cho vòng tròn tiếp theo
                    x += ((nextCircle as any).x - x) * 0.3;
                    y += ((nextCircle as any).y - y) * 0.3;
                }
            });

            requestRef.current = requestAnimationFrame(animateCircles);
        };

        // Bắt đầu animation
        animateCircles();

        // Cleanup khi component unmount
        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            if (requestRef.current) {
                cancelAnimationFrame(requestRef.current);
            }
        };
    }, []);

    return (
        <>
            {colors.map((color, index) => (
                <Box
                    key={index}
                    ref={(el) => {
                        circlesRef.current[index] = el as HTMLDivElement | null;
                    }}
                    className="circle"
                    sx={{
                        height: "18px",
                        width: "18px",
                        borderRadius: "24px",
                        backgroundColor: color, // Gán màu trực tiếp từ mảng
                        position: "fixed",
                        top: 0,
                        left: 0,
                        pointerEvents: "none", // Quan trọng: để chuột có thể click xuyên qua
                        zIndex: 99999999,
                        // Thêm transition nhẹ nếu muốn, nhưng logic JS đã xử lý độ mượt rồi
                        display: "block",
                    }}
                />
            ))}
        </>
    );
}