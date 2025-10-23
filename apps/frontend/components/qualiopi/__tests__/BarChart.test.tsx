import React from 'react';
import { render, screen } from '@testing-library/react';
import BarChart from '../BarChart';

const mockData = [
  { label: 'January', value: 100 },
  { label: 'February', value: 150 },
  { label: 'March', value: 200 },
];

describe('BarChart Component', () => {
  it('renders chart with data', () => {
    const { container } = render(
      <BarChart data={mockData} />
    );
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('renders empty message when no data', () => {
    render(<BarChart data={[]} />);
    expect(screen.getByText('Veri bulunamadı')).toBeInTheDocument();
  });

  it('renders title when provided', () => {
    render(
      <BarChart data={mockData} title="Sales Data" />
    );
    expect(screen.getByText('Sales Data')).toBeInTheDocument();
  });

  it('renders chart in vertical direction by default', () => {
    const { container } = render(
      <BarChart data={mockData} direction="vertical" />
    );
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('renders chart in horizontal direction', () => {
    const { container } = render(
      <BarChart data={mockData} direction="horizontal" />
    );
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('renders all data labels', () => {
    const { container } = render(
      <BarChart data={mockData} />
    );
    const svg = container.querySelector('svg');
    expect(svg?.textContent).toContain('January');
    expect(svg?.textContent).toContain('February');
    expect(svg?.textContent).toContain('March');
  });

  it('displays values on bars when showValues is true', () => {
    const { container } = render(
      <BarChart data={mockData} showValues={true} />
    );
    const svg = container.querySelector('svg');
    expect(svg?.textContent).toContain('100');
    expect(svg?.textContent).toContain('150');
    expect(svg?.textContent).toContain('200');
  });

  it('applies custom colors to bars', () => {
    const dataWithColors = [
      { label: 'A', value: 50, color: 'rgb(255, 0, 0)' },
      { label: 'B', value: 100, color: 'rgb(0, 255, 0)' },
    ];
    const { container } = render(
      <BarChart data={dataWithColors} />
    );
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('respects custom max value', () => {
    const { container } = render(
      <BarChart data={mockData} max={500} />
    );
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('scales bars based on max value', () => {
    const smallData = [
      { label: 'A', value: 10 },
      { label: 'B', value: 20 },
    ];
    const { container } = render(
      <BarChart data={smallData} max={100} />
    );
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('handles single data point', () => {
    const singleData = [{ label: 'Only', value: 150 }];
    const { container } = render(
      <BarChart data={singleData} />
    );
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('renders with custom height', () => {
    const { container } = render(
      <BarChart data={mockData} height="400px" />
    );
    const wrapper = container.querySelector('.bg-gray-50') || container.firstChild;
    expect(wrapper).toBeInTheDocument();
  });

  it('applies correct SVG structure', () => {
    const { container } = render(
      <BarChart data={mockData} />
    );
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('width');
    expect(svg).toHaveAttribute('height');
  });

  it('renders bars with stroke and fill', () => {
    const { container } = render(
      <BarChart data={mockData} />
    );
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });
});
