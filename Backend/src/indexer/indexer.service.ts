import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { SorobanService } from '../soroban/soroban.service';

@Injectable()
export class IndexerService implements OnModuleInit {
  private readonly logger = new Logger(IndexerService.name);
  private lastProcessedLedger = 0;
  private pollInterval: NodeJS.Timeout | null = null;

  constructor(private readonly soroban: SorobanService) {}

  onModuleInit() {
    this.logger.log('Indexer starting — polling Soroban for GistRegistry events');
    this.startPolling();
  }

  private startPolling(intervalMs = 6_000) {
    this.pollInterval = setInterval(() => {
      void this.poll();
    }, intervalMs);
  }

  private async poll() {
    try {
      const events = await this.soroban.getEventsSince(this.lastProcessedLedger);

      if (events.length === 0) return;

      this.logger.log(
        `Indexer: ${events.length} new event(s) from ledger ${this.lastProcessedLedger}`,
      );

      for (const event of events) {
        // TODO: upsert each event into the gists table via GistsService / TypeORM
        this.logger.debug(`Indexed gist ${event.gistId} @ cell ${event.locationCell}`);
        this.lastProcessedLedger = Math.max(this.lastProcessedLedger, event.createdAt);
      }
    } catch (err) {
      this.logger.error('Indexer poll failed', err);
    }
  }

  onModuleDestroy() {
    if (this.pollInterval) clearInterval(this.pollInterval);
  }
}
