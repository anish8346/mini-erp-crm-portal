import { prisma } from '../config/prisma';

export async function generateNextChallanNumber(): Promise<string> {
  // Find the latest created challan
  const latestChallan = await prisma.challan.findFirst({
    orderBy: { createdAt: 'desc' },
    select: { challanNumber: true },
  });

  if (!latestChallan || !latestChallan.challanNumber.startsWith('CH-')) {
    return 'CH-000001';
  }

  // Extract numeric part from CH-XXXXXX
  const parts = latestChallan.challanNumber.split('-');
  const lastNum = parseInt(parts[1], 10);

  if (isNaN(lastNum)) {
    const totalCount = await prisma.challan.count();
    return `CH-${String(totalCount + 1).padStart(6, '0')}`;
  }

  const nextNum = lastNum + 1;
  return `CH-${String(nextNum).padStart(6, '0')}`;
}
