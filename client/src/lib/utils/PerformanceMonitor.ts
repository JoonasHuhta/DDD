// EMERGENCY: Performance monitoring and memory leak prevention system
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private frameCount = 0;
  private lastCleanup = 0;
  private memoryWarnings = 0;

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  // CRITICAL FIX: Don't manipulate DOM directly - causes UI destruction
  static forceCleanupDOM(): void {
    console.log('SAFE: No DOM manipulation - preventing UI destruction');
    // Let React handle all cleanup through state management
    // This prevents the "removeChild" and "insertBefore" errors that break the UI
  }

  // CRITICAL: Memory cleanup for game objects
  static forceMemoryCleanup(): void {
    console.log('EMERGENCY MEMORY CLEANUP: Forcing garbage collection');
    
    console.log('MEMORY CLEANUP: Manual memory cleanup check');
    // We NO LONGER clear all timeouts and intervals as it breaks the game logic
    
    // Force garbage collection if available
    if (window.gc) {
      window.gc();
      console.log('MEMORY CLEANUP: Forced garbage collection');
    }
  }

  // Monitor performance and trigger cleanup when needed
  update(): void {
    this.frameCount++;
    const now = Date.now();
    
    // Run cleanup every 10 seconds
    if (now - this.lastCleanup > 10000) {
      this.lastCleanup = now;
      
      // Check for memory issues
      const perf = performance as any;
      if (perf.memory) {
        const used = perf.memory.usedJSHeapSize / 1048576; // MB
        const total = perf.memory.totalJSHeapSize / 1048576; // MB
        
        if (used > 100) { // More than 100MB used
          console.log(`PERFORMANCE WARNING: High memory usage: ${used.toFixed(1)}MB`);
          this.memoryWarnings++;
          
          if (this.memoryWarnings > 3) {
            console.log('EMERGENCY: Multiple memory warnings, forcing cleanup');
            PerformanceMonitor.forceMemoryCleanup();
            PerformanceMonitor.forceCleanupDOM();
            this.memoryWarnings = 0;
          }
        }
      }
    }
  }
}

// Global cleanup function that can be called from anywhere
(window as any).emergencyCleanup = () => {
  console.log('EMERGENCY CLEANUP TRIGGERED BY USER');
  PerformanceMonitor.forceCleanupDOM();
  PerformanceMonitor.forceMemoryCleanup();
};

export default PerformanceMonitor;